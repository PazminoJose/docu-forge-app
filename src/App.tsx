import { Container } from "@mantine/core";
import FileSelection from "./screens/FileSelection";

export default function App() {
  return (
    <main className="h-full w-full p-4" >
      <Container className="h-full w-full">
        <FileSelection />
      </Container>
    </main>
  )
}

