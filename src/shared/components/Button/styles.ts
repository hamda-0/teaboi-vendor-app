import { StyleSheet } from "react-native";
import { theme } from "../../../theme";
import pixelPerfect from "../../../utils/pixelPerfect";

export const styles = StyleSheet.create({
  container: {
    height: pixelPerfect(56),
    paddingHorizontal: theme.spacing.l,
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', 
  },
  text: {
    ...theme.typography.button,
    textAlign: 'center',
  },
});
