import React from 'react';
import styled from 'styled-components';
import { Card } from './components/Card';
const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

function App() {
  return (
    <AppContainer>
      <Card />
    </AppContainer>
  );
}

export default App;
