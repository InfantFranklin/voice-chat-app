import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const ChatRoom = ({ channel }) => {
  const client = useRef(null);
  const localAudioTrack = useRef(null);
  const remoteAudioTracks = useRef({});
  const appId = process.env.REACT_APP_AGORA_APP_ID;
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [userId, setUserId] = useState(null);
  console.log("Agora App ID:", appId);

  useEffect(() => {
    const init = async () => {
      try {
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        const uid = await client.current.join(appId, channel, null, null);
        console.log("Successfully joined the channel:", channel);
        console.log("User " + uid + " joined channel: " + channel);
        setUserId(uid);
        setConnectionStatus("Connected");

        try {
          localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true, // Acoustic Echo Cancellation
            ANS: true, // Automatic Noise Suppression
          });
          console.log("Local audio track created");

          await client.current.publish([localAudioTrack.current]);
          console.log("Local audio track published");
        } catch (publishError) {
          console.error("Failed to publish local audio track: ", publishError);
        }

        client.current.on("user-published", async (user, mediaType) => {
          try {
            await client.current.subscribe(user, mediaType);
            if (mediaType === "audio") {
              const remoteAudioTrack = user.audioTrack;
              remoteAudioTracks.current[user.uid] = remoteAudioTrack;
              await remoteAudioTrack.play();
              console.log(
                "Subscribed to remote audio track from user:",
                user.uid
              );
            }
          } catch (subscribeError) {
            console.error(
              "Failed to subscribe to remote user:",
              subscribeError
            );
          }
        });

        client.current.on("user-unpublished", (user) => {
          const remoteAudioTrack = remoteAudioTracks.current[user.uid];
          if (remoteAudioTrack) {
            remoteAudioTrack.stop();
            delete remoteAudioTracks.current[user.uid];
            console.log(
              "Unsubscribed from remote audio track from user:",
              user.uid
            );
          }
        });
      } catch (error) {
        console.error("Failed to join channel:", error);
        setConnectionStatus("Failed to connect");
      }
    };

    init();

    // Clean up function
    return () => {
      // eslint-disable-next-line
      const currentRemoteAudioTracks = { ...remoteAudioTracks.current };
      client.current.leave();
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
      }
      Object.values(currentRemoteAudioTracks).forEach((track) => track.stop());
    };
  }, [channel, appId]);

  return (
    <div>
      {connectionStatus}: {connectionStatus} to {channel} <br />
      User ID: {userId ? userId : "Loading..."}
    </div>
  );
};

export default ChatRoom;
