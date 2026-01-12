import { Box, Text, Title } from "@canva/app-ui-kit";
import { FormattedMessage } from "react-intl";

export function App() {
    return (
        <Box padding="2u">
            <Title size="medium">
                <FormattedMessage
                    defaultMessage="RSVP & Wishes"
                    description="App title"
                />
            </Title>
            <Box paddingTop="2u">
                <Text>
                    <FormattedMessage
                        defaultMessage="This app will be built in Phase 3. Backend is ready for testing."
                        description="Placeholder message"
                    />
                </Text>
            </Box>
        </Box>
    );
}
