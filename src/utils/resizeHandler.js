import { useState, useRef } from "react";

// ! can't get this shit to work, virtual keyboards fuck everything up, can scroll past document body
export default function useResizeHandler() {
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const timerRef = useRef();

  // console.log(window);
  // console.log(document);
  const body = document.querySelector("body");
  // const main = document.querySelector("main");
  // const body = document.querySelector("#root");
  // const thing = document.querySelector("#thing");
  // console.log(body.scrollTop);
  console.log(body.style.height);

  window.visualViewport.addEventListener("resize", () => {
    // console.log("resize");
    body.style.height = "100px";
    function setTimer() {
      // console.log(body);
      // console.log(body.scrollHeight);
      timerRef.current = setTimeout(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.visualViewport.height,
          // bodyTop: body.scrollHeight,
        });
        // body.scrollTop = body.scrollHeight;
        // setTimeout(() => {
        //   // body.scrollTop = 100;
        //   thing.scrollIntoView();
        // }, 1000);
        // body.scrollIntoView();
        // console.log(window.visualViewport.height);
        // console.log(window.visualViewport.height.toString());
        // main.style.height = window.visualViewport.height.toString();
        // console.log(main.style.height);
      }, 500);
    }

    if (!timerRef.current) {
      setTimer();
    } else {
      // console.log(viewportDimensions);
      clearTimeout(timerRef.current);
      setTimer();
    }

    // console.log(window.visualViewport);
    // console.count("res");
    // console.log(window.visualViewport.height);
    // console.log(window.visualViewport.width);
  });

  // console.log(viewportDimensions);

  return {
    reactiveHeight: viewportDimensions.height,
    reactiveWidth: viewportDimensions.width,
    // bodyTop: viewportDimensions.bodyTop,
  };
}
