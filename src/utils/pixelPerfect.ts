import { create } from 'react-native-pixel-perfect';

const pixelPerfect = (size: number) => {
  const designResolution = {
    width: 375,
    height: 811,
  };
  //this size is the size that your design is made for (screen size)
  // const designResolution = DeviceInfo.isTablet()
  // ? {width: 768, height: 1024} // Tablet base design
  // : {width: 375, height: 811}; // Phone base design
  const perfectSize = create(designResolution);
  return perfectSize(size);
};

export default pixelPerfect;
