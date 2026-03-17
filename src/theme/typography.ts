import fonts from "./fonts";
import { colors } from "./colors";
import pixelPerfect from "../utils/pixelPerfect";

export const typography = {
  header: {
    fontSize: pixelPerfect(28),
    fontFamily: fonts.GoogleSansBold,
    color: colors.text.primary,
  },
  subheader: {
    fontSize: pixelPerfect(18),
    fontFamily: fonts.GoogleSansMedium,
    color: colors.text.secondary,
  },
  body: {
    fontSize: pixelPerfect(16),
    color: colors.text.primary,
    lineHeight: pixelPerfect(24),
    fontFamily: fonts.GoogleSansMedium,
  },
  caption: {
    fontSize: pixelPerfect(14),
    fontFamily: fonts.GoogleSansMedium,
    color: colors.text.secondary,
  },
  button: {
    fontSize: pixelPerfect(16),
    fontFamily: fonts.GoogleSansMedium,
    color: colors.text.light,
  }
};