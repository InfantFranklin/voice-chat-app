import React, { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const ChatRoom = ({ channel }) => {
  const client = useRef(null);
  const localAudioTrack = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.current.join(
          process.env.REACT_APP_AGORA_APP_ID,
          channel,
          null,
          null
        );

        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true, // Acoustic Echo Cancellation
          ANS: true, // Automatic Noise Suppression
        });

        await client.current.publish([localAudioTrack.current]);

        client.current.on("user-published", async (user, mediaType) => {
          await client.current.subscribe(user, mediaType);
          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
          }
        });

        client.current.on("user-unpublished", (user) => {
          const remoteAudioTrack = user.audioTrack;
          if (remoteAudioTrack) {
            remoteAudioTrack.stop();
          }
        });
      } catch (error) {
        console.error("Failed to join channel:", error);
      }
    };

    init();

    // Clean up function
    return () => {
      client.current.leave();
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
      }
    };
  }, [channel]);

  return <div>Connected to {channel}</div>;
};

export default ChatRoom;
