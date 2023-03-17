const ts = require("typescript");
const path = require("path");
const glob = require("glob");

const dependencies = [];
const rootDir = path.resolve(__dirname, "../demo");
const rootFiles = glob.globSync(`${rootDir}/*.*`);
const rootFile = path.resolve(rootDir, "./index.tsx");

const options = {
  target: ts.ScriptTarget.ES2017, // 目标版本为ES2017
  module: ts.ModuleKind.ESNext, // 模块类型为ES6模块
  jsx: ts.JsxEmit.React, // 启用jsx语法支持
};

const program = ts.createProgram({
  rootNames: rootFiles, // 指定目录
  options,
});

const ast = program.getSourceFile(rootFile);

const findTargetFile = (arr, p) => {
  return arr.find((i) => i.startsWith(p));
};

const walk = (node) => {
  if (!node) return;
  let parentFileName = node.fileName;
  ts.forEachChild(node, (nodeChild) => {
    if (ts.isImportDeclaration(nodeChild)) {
      let moduleName = path.join(
        path.dirname(parentFileName),
        nodeChild.moduleSpecifier.text
      );
      dependencies.push(moduleName);
      let source = program.getSourceFile(findTargetFile(rootFiles, moduleName));
      walk(source);
    }
  });
};

walk(ast);

console.log(dependencies);
