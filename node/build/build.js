import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import path from 'path';

/**
 * @param {import('rollup').TransformPluginContext} context
 * @param {string} code
 * @param {string} id
 * @returns {Promise<import('rollup').TransformResult>}
 */
const transform = async (context, code, id) => {
  const ms = new MagicString(code);
  const ast = context.parse(code);
  walk(ast, {
    enter(node, parent) {
      if (node.type === 'MemberExpression') {
        if (
          parent.type === 'BinaryExpression' &&
          (parent.left.value === 'windows' || parent.right.value === 'windows') &&
          node.property.name === 'os' &&
          node.object.type === 'MemberExpression' &&
          node.object.object.name === 'Deno' &&
          node.object.property.name === 'build'
        ) {
          ms.prepend(`import { platform } from 'os';\n`)
          ms.overwrite(parent.start, parent.end, `platform() === 'win32'`);
        } else if (node.object.name === 'Deno') {
          if (node.property.name === 'args')
            ms.overwrite(node.start, node.end, `process.argv.slice(2)`);
          else if (node.property.name.startsWith('std'))
            ms.overwrite(node.object.start, node.object.end, 'process');
        }
      }
    },
    leave() {},
  });
  return {
    code: ms.toString(),
    map: ms.generateMap({ hires: true }),
  };
};

/** @returns {import('rollup').Plugin} */
function build() {
  return {
    name: 'webext-build',
    resolveId(importee) {
      if (importee.endsWith('_util.ts')) {
        return path.join(__dirname, 'build/_util.ts');
      }
    },
    transform(code, id) {
      return transform(this, code, id);
    },
  };
}

export default build;
