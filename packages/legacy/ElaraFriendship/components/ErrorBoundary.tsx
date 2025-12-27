import React from "react";
import { Text, View } from "react-native";

type Props = { children?: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // TODO: report to monitoring service
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>Algo deu errado — tente reiniciar a app.</Text>
        </View>
      );
    }
    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
