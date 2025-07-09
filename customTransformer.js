const upstreamTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = async (props) => {
  // Replace import.meta with an empty object to polyfill for React Native
  const code = props.src.replace(/import\.meta/g, '{}');
  return upstreamTransformer.transform({ ...props, src: code });
};
