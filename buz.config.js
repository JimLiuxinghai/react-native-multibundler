const pathSep = require('path').sep;
const plaformModules = require('./multibundler/platformMapping.json');
const getModuleId = require('./multibundler/getModulelId').getModuleId;

function postProcessModulesFilter(module) {
  const projectRootPath = __dirname;
  if (plaformModules == null || plaformModules.length == 0) {
    console.log('请先打基础包');
    process.exit(1);
    return false;
  }
  const path = module['path']
  if (path.indexOf("__prelude__") >= 0 ||
    path.indexOf("/node_modules/react-native/Libraries/polyfills") >= 0 ||
    path.indexOf("source-map") >= 0 ||
    path.indexOf("/node_modules/metro/src/lib/polyfills/") >= 0) {
    return false;
  }
  if (module['path'].indexOf(pathSep + 'node_modules' + pathSep) > 0) {
    if ('js' + pathSep + 'script' + pathSep + 'virtual' == module['output'][0]['type']) {
      return true;
    }
    const name = getModuleId(projectRootPath,path);
    if (plaformModules.indexOf(name) >= 0) {//这个模块在基础包已打好，过滤
      return false;
    }
  }
  return true;
}

function createModuleIdFactory() {
  const projectRootPath = __dirname;
  return path => {
    let name = getModuleId(projectRootPath,path);
    return name;
  };
}


module.exports = {

  serializer: {
    createModuleIdFactory: createModuleIdFactory,
    processModuleFilter: postProcessModulesFilter
    /* serializer options */
  }
};
