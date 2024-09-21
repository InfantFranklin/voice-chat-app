import React, { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const ChatRoom = ({ channel }) => {
  const client = useRef(null);
  const localAudioTrack = useRef(null);
  const remoteAudioTracks = useRef({});
  const appId = process.env.REACT_APP_AGORA_APP_ID;
  console.log("Agora App ID:", appId);

  useEffect(() => {
    const init = async () => {
      try {
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        const uid = await client.current.join(appId, channel, null, null);
        console.log("Successfully joined the channel:", channel);
        console.log("Local user ID:", uid);

        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true, // Acoustic Echo Cancellation
          ANS: true, // Automatic Noise Suppression
        });
        console.log("Local audio track created");

        await client.current.publish([localAudioTrack.current]);
        console.log("Local audio track published");

        client.current.on("user-published", async (user, mediaType) => {
          await client.current.subscribe(user, mediaType);
          if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTracks.current[user.uid] = remoteAudioTrack;
            remoteAudioTrack.play();
            console.log(
              "Subscribed to remote audio track from user:",
              user.uid
            );
            console.log(
              "Remote audio is successfully playing for user:",
              user.uid
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
      }
    };

    init();

    // Clean up function
    return () => {
      client.current.leave();
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
      }
      Object.values(remoteAudioTracks.current).forEach((track) => track.stop());
    };
  }, [channel, appId]);

  return <div>Connected to {channel}</div>;
};

export default ChatRoom;
