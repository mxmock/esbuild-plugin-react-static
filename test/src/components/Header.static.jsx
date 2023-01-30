import React from "react";
import ConnectBtn from "./ConnectBtn";
import { getRndInteger } from "../utils/random.utils";

const Header = ({ data }) => {
  const getId = () => data.id;

  React.useEffect(() => {
    console.log("Header appear");
  }, []);

  return (
    <div>
      <div>
        <span>Logo</span>
        <span suppressHydrationWarning={true}>
          App test version {getRndInteger(1, 100)}
        </span>
      </div>

      <div>
        <p>Id data: {getId()}</p>
      </div>

      <div>
        <ConnectBtn text={"Connexion"} />
      </div>
    </div>
  );
};

export default Header;
