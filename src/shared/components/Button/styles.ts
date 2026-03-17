import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', 
    minHeight: 56,
  },
  text: {
    ...theme.typography.button,
    textAlign: 'center',
  },
});
