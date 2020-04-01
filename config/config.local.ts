import { DefaultConfig } from './config.default';

export default () => {
  const config: DefaultConfig = {};
  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/edith',
      options: {},
    },
  };
  return config;
};
