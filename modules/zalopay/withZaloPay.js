const { withAndroidManifest, withAppBuildGradle, withMainApplication, withInfoPlist } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// Android: thêm AAR và khởi tạo SDK
const withZaloPayAndroid = (config) => {
  // Thêm AAR vào build.gradle
  config = withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes('zpdk-release')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation(name: 'zpdk-release', ext: 'aar')`
      );
      // Thêm flatDir
      mod.modResults.contents = mod.modResults.contents.replace(
        /repositories\s*\{/,
        `repositories {\n        flatDir { dirs 'libs' }`
      );
    }
    return mod;
  });

  return config;
};

// iOS: thêm URL schemes
const withZaloPayIOS = (config) => {
  config = withInfoPlist(config, (mod) => {
    const schemes = mod.modResults.LSApplicationQueriesSchemes || [];
    if (!schemes.includes('zalopay')) {
      mod.modResults.LSApplicationQueriesSchemes = [...schemes, 'zalo', 'zalopay', 'zalopay.api.v2'];
    }
    // Thêm URL scheme để ZaloPay callback về app
    const urlTypes = mod.modResults.CFBundleURLTypes || [];
    if (!urlTypes.find(t => t.CFBundleURLSchemes?.includes('dacsanviet'))) {
      urlTypes.push({
        CFBundleURLSchemes: ['dacsanviet'],
        CFBundleURLName: 'com.dacsanviet.app',
      });
      mod.modResults.CFBundleURLTypes = urlTypes;
    }
    return mod;
  });
  return config;
};

module.exports = (config) => {
  config = withZaloPayAndroid(config);
  config = withZaloPayIOS(config);
  return config;
};
