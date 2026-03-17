import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.s,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.m,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    height: '100%',
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
