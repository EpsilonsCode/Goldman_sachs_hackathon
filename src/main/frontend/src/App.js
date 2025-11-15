import Keycloak from 'keycloak-js';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Profile } from './Profile';

function App() {

    const kc = new Keycloak({
      url: 'http://localhost:8180',
      realm: 'hackathon',
      clientId: 'hackathon-app',
    });


  return (
    <ReactKeycloakProvider authClient={kc}>
      <Profile />
    </ReactKeycloakProvider>
  );
}

export default App;
