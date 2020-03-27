import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  security: {
    enable: false,
    package: 'egg-security',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  validate: {
    enable: true,
   package: 'egg-validate'
  }
};

export default plugin;
