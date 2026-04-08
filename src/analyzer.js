// src/analyzer.js

import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";

/**
 * Analyze a file and return detected issues
 * @param {string} filePath
 * @returns {Array} issues
 */
export function analyzeFile(filePath) {
  let code;

  try {
    code = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`❌ Failed to read file: ${filePath}`);
    return [];
  }

  let ast;

  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });
  } catch (err) {
    console.error(`❌ Failed to parse file: ${filePath}`);
    return [];
  }

  const issues = [];

  traverse(ast, {
    /**
     * Detect console.log inside catch blocks
     */
    CatchClause(path) {
      path.traverse({
        CallExpression(innerPath) {
          const callee = innerPath.node.callee;

          if (
            callee.type === "MemberExpression" &&
            callee.object.name === "console" &&
            callee.property.name === "log"
          ) {
            issues.push({
              type: "console-usage",
              message: "Avoid using console.log inside catch blocks",
              loc: innerPath.node.loc
            });
          }
        }
      });
    },

    /**
     * Detect unused variables
     */
    VariableDeclarator(path) {
      const name = path.node.id.name;
      const binding = path.scope.getBinding(name);

      if (binding && !binding.referenced) {
        issues.push({
          type: "unused-variable",
          name,
          message: `Variable '${name}' is declared but never used`,
          loc: path.node.loc
        });
      }
    },

    /**
     * Detect nested callbacks (callback hell starter)
     */
    CallExpression(path) {
      const parent = path.parent;

      if (
        parent.type === "CallExpression" &&
        path.node.arguments.some(arg => arg.type === "FunctionExpression")
      ) {
        issues.push({
          type: "nested-callback",
          message: "Nested callback detected. Consider async/await",
          loc: path.node.loc
        });
      }
    },

    /**
     * Detect missing process.exit in critical error paths
     */
    IfStatement(path) {
      const testCode = code.slice(path.node.start, path.node.end);

      if (
        testCode.includes("error") &&
        !testCode.includes("process.exit")
      ) {
        issues.push({
          type: "missing-process-exit",
          message: "Possible critical error without process.exit(1)",
          loc: path.node.loc
        });
      }
    }
  });

  return issues;
}

// export default analyzeFile;