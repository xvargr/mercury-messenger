import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);

  const [groupData, setGroupData] = useState({
    name: "",
    image: { url: "", filename: "", thumbnail: "" },
    channels: {
      text: [],
      task: [],
    },
  });

  // const [userData, setUserData] = useState(null); // ! <= clears on refresh, store in local or session

  // * you can also put functions here and export them
  // * push this this to array etc

  const dataState = {
    groupData,
    setGroupData,
    groupMounted,
    setGroupMounted,
    // userData,
    // setUserData,
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
