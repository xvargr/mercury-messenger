import { useParams } from "react-router-dom";
// import { useParams, useNavigate } from "react-router-dom";
// import { useContext } from "react";
// components
import Sender from "../chat/SenderWrapper";
import Message from "../chat/Message";
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
// context
// import { DataContext } from "../context/DataContext";

function ChatWindow() {
  const { channel } = useParams();
  // const { groupData, groupMounted } = useContext(DataContext);
  // const navigate = useNavigate();

  // ! waiting for channels remodel
  // redirect 404 if channel not found
  // if (groupMounted && !groupData.find((grp) => grp.name === channel)) {
  //   navigate("/404");
  // }

  return (
    <section className="bg-gray-600 h-screen w-3/4 flex flex-col relative">
      <ChannelBanner name={channel} />

      <div className="w-full flex-grow overflow-y-scroll scrollbar-dark">
        <Sender
          user="Libre"
          img="https://picsum.photos/100/100"
          timestamp="1.12pm"
        >
          <Message>What was I</Message>
          <Message>If not a speck of dust</Message>
          <Message>In the wind</Message>
        </Sender>

        <Sender
          user="Haust"
          img="https://picsum.photos/100/100"
          timestamp="1.23pm"
        >
          <Message>Feelings of pain</Message>
          <Message>An ache in heart</Message>
          <Message>Of bygone memories</Message>
        </Sender>

        <Sender
          user="Lorem"
          img="https://picsum.photos/100/100"
          timestamp="1.30pm"
          type="mention"
        >
          <Message>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam
            autem ex repellat, neque ullam deserunt pariatur accusantium
            cupiditate enim est voluptas sequi eaque excepturi illum voluptate
            consequuntur at quisquam eveniet!
          </Message>
        </Sender>

        <Sender
          user="Arurile"
          img="https://picsum.photos/100/100"
          timestamp="3 minutes ago"
        >
          <Message>Has the wind stop</Message>
          <Message>I would go no further</Message>
          <Message>I may rest</Message>
        </Sender>

        <Sender
          user="Lorem"
          img="https://picsum.photos/100/100"
          timestamp="moments ago"
        >
          <Message>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus
            sit repellendus accusamus, repudiandae quod distinctio cum,
            praesentium placeat, ipsum assumenda aperiam nulla? Beatae corrupti,
            reiciendis non quibusdam voluptas animi repudiandae.
          </Message>
        </Sender>
        <div className="w-full h-24"></div>
        <ChatInputBox />
      </div>
    </section>
  );
}

export default ChatWindow;
