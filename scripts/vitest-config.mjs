import path from 'path';

export const vitestConfig = ({ folder }) => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, `../packages/${folder}/src`)
      }
    }
  };
};
