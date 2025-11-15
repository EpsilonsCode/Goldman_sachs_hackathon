import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

export function Profile() {
  const { keycloak, initialized } = useKeycloak();
  const [currentUser, setCurrentUser] = useState(null);



  useEffect(() => {
    if (!keycloak.authenticated) {
        console.log("A");
        return;
    };

    const loadUser = async () => {
      try {
        const res = await fetch("localhost:8080/token", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch current user");

        const data = await res.json();
        console.log("DATA: ");
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, [keycloak]);

  async function essa() {
        try {
        const res = await fetch("http://localhost:8080/token", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch current user");

        const data = await res.json();
        console.log("DATA: ");
        console.log(data);
      } catch (err) {
        console.error(err);
      }
  }

    if (!initialized) return <div>Loading…</div>;
    essa();

  return (
    <div>
      {keycloak.authenticated ? "Logged in" : "Logged out"}

      {currentUser && (
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      )}
    </div>
  );
}
