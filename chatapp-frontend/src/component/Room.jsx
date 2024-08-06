import { useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBIcon,
    MDBBtn,
    MDBTypography,
    MDBTextArea,
    MDBCardHeader,
    MDBFile
} from "mdb-react-ui-kit";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

var stompClient = null;
const Room = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const [file, setFile] = useState(null);
    const maxFileSize = 5 * 1024 * 1024;
    const [userData, setUserData] = useState({
        username: "",
        receivername: "",
        connected: false,
        message: "",
    });

    const connect = () => {
        let Sock = new SockJS(`${process.env.REACT_APP_SPRING_SERVER}/ws`);
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        setUserData({ ...userData, connected: true });
        stompClient.subscribe("/chatroom/public", onMessageReceived);
        stompClient.subscribe(
            "/user/" + userData.username + "/private",
            onPrivateMessage
        );
        userJoin();
    };

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN",
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    };

    const onPrivateMessage = (payload) => {
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    };

    const onError = () => {
        alert("Can not connect to server")
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    };
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE",
                date: new Date().toLocaleString()
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, message: "" });
        }
    };

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE",
                date: new Date().toLocaleString(),
            };

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, message: "" });
        }
    };

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, username: value });
    };

    const registerUser = () => {
        connect();
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile.size > maxFileSize) {
            alert("File size exceeds 5MB limit. Please select a smaller file.");
            setFile(null);
        } else {
            setFile(selectedFile);
        }
    };

    const sendFile = () => {
        if (stompClient && file) {
            const formData = new FormData();
            formData.append("file", file);
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE",
            };
            if (tab !== "CHATROOM") {
                chatMessage = { ...chatMessage, receiverName: tab }
            }
            formData.append("messageDto", JSON.stringify(chatMessage));
            fetch(`${process.env.REACT_APP_SPRING_SERVER}/upload`, {
                method: "POST",
                body: formData,
            })
                .then(() => {
                    alert("File uploaded successfully");
                    document.getElementById('formFileLg').value = null;
                })
                .catch(() => {
                    alert("Error uploading file");
                });
        }
    };

    const dowloadFile = (fileData, filename) => {
        const byteCharacters = atob(fileData);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    };


    const meeting = async (item) => {
        const appID = 1093356179;
        const serverSecret = `${process.env.REACT_APP_SERVER_SECRECT}`;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, "CHATROOM", userData.username, userData.username);
        const zegocloud = ZegoUIKitPrebuilt.create(kitToken);
        zegocloud.joinRoom(
            {
                container: item,
                scenario: {
                    mode: ZegoUIKitPrebuilt.GroupCall,
                },
                showScreenSharingButton: false,
                showTextChat: false,
                
            }
        );
    }

    return (
        <div className="container">
            {userData.connected ? (
                <MDBContainer
                    fluid
                    className="py-5"
                    style={{ backgroundColor: "#eee" }}
                >
                    <MDBRow>
                        <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
                            <h5 className="font-weight-bold mb-3 text-center text-lg-start">
                                Member
                            </h5>
                            <MDBCard>
                                <MDBCardBody>
                                    <MDBTypography listUnStyled className="mb-0">
                                        <li
                                            onClick={() => {
                                                setTab("CHATROOM");
                                            }}
                                            className={`member ${tab === "CHATROOM" && "active"}`}
                                        >
                                            <a href="#!" className="d-flex justify-content-between">
                                                <div className="d-flex flex-row">
                                                    <img
                                                        src="https://avatar.iran.liara.run/public"
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                                                        width="60"
                                                    />
                                                    <div className="pt-1">
                                                        <p className="fw-bold mb-0">Chat room</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                        {[...privateChats.keys()].filter(item => item !== userData?.username).map((name, index) => (
                                            <li
                                                onClick={() => {
                                                    setTab(name);
                                                }}
                                                className={`member ${tab === name && "active"}`}
                                                key={index}
                                            >
                                                <a href="#!" className="d-flex justify-content-between">
                                                    <div className="d-flex flex-row">
                                                        <img
                                                            src="https://avatar.iran.liara.run/public"
                                                            alt="avatar"
                                                            className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                                                            width="60"
                                                        />
                                                        <div className="pt-1">
                                                            <p className="fw-bold mb-0">{name}</p>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </MDBTypography>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>

                        <MDBCol md="6" lg="7" xl="8">

                            {tab === "CHATROOM" ?
                                <>
                                    <ul className="chat-messages bg-white" style={{ height: "65vh", overflowY: "scroll" }}>

                                        {publicChats.map((chat, index) => (
                                            <li className="d-flex justify-content-between mb-4" key={index}>
                                                {chat.senderName === userData.username &&
                                                    <img
                                                        src="https://avatar.iran.liara.run/public"
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                                                        width="60"
                                                    />}
                                                <MDBCard>
                                                    <MDBCardHeader className="d-flex justify-content-between p-3">
                                                        <p className="fw-bold mb-0">{chat.senderName}</p>
                                                        <p className="text-muted small mb-0">
                                                            <MDBIcon far icon="clock" /> {chat?.date}
                                                        </p>
                                                    </MDBCardHeader>
                                                    <MDBCardBody>
                                                        <p className="mb-0">
                                                            {chat.message}
                                                            {chat?.fileData &&
                                                                <div className="message-data"><div class="download-button" onClick={() => dowloadFile(chat?.fileData, chat?.filename)}>{chat?.filename}</div>
                                                                </div>}
                                                        </p>
                                                    </MDBCardBody>
                                                </MDBCard>
                                                {chat.senderName !== userData.username &&
                                                    <img
                                                        src="https://avatar.iran.liara.run/public"
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                                                        width="60"
                                                    />}
                                            </li>
                                        ))}
                                    </ul>
                                        <div className="bg-white mb-3">
                                            <MDBTextArea label="Message" id="textAreaExample" rows={4} value={userData.message} onChange={handleMessage} />
                                        </div>
                                        <MDBBtn  onClick={sendValue} color="info" rounded className="float-end" disabled={!userData?.message}>
                                            Send
                                        </MDBBtn>
                                    <MDBFile label='Large file input example' size='lg' id='formFileLg' onChange={handleFileChange} />
                                    <MDBBtn type='submit' color="info" rounded className="float-end" onClick={sendFile} disabled={!file} >
                                        Send File
                                    </MDBBtn>

                                </>
                                :
                                <>
                                    <ul className="chat-messages bg-white" style={{ height: "65vh", overflowY: "scroll" }}>
                                        {[...privateChats.get(tab)].map((chat, index) => (
                                            <li className="d-flex justify-content-between mb-4" key={index}>
                                                {chat.senderName === userData.username &&
                                                    <img
                                                        src="https://avatar.iran.liara.run/public"
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                                                        width="60"
                                                    />}
                                                <MDBCard>
                                                    <MDBCardHeader className="d-flex justify-content-between p-3">
                                                        <p className="fw-bold mb-0">{chat.senderName}</p>
                                                        <p className="text-muted small mb-0">
                                                            <MDBIcon far icon="clock" /> {chat?.date}
                                                        </p>
                                                    </MDBCardHeader>
                                                    <MDBCardBody>
                                                        <p className="mb-0">
                                                            {chat.message}
                                                            {chat?.fileData &&
                                                                <div className="message-data"><div class="download-button" onClick={() => dowloadFile(chat?.fileData, chat?.filename)}>{chat?.filename}</div>
                                                                </div>}
                                                        </p>
                                                    </MDBCardBody>
                                                </MDBCard>
                                                {chat.senderName !== userData.username &&
                                                    <img
                                                        src="https://avatar.iran.liara.run/public"
                                                        alt="avatar"
                                                        className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                                                        width="60"
                                                    />}
                                            </li>
                                        ))}
                                    </ul>
                                    <form>
                                        <div className="bg-white mb-3">
                                            <MDBTextArea label="Message" id="textAreaExample" rows={4} value={userData.message} onChange={handleMessage} />
                                        </div>
                                        <MDBBtn onClick={sendPrivateValue} color="info" rounded className="float-end" disabled={!userData?.message}>
                                            Send
                                        </MDBBtn>
                                    </form>
                                </>
                            }
                        </MDBCol>
                    </MDBRow>
                    <div ref={meeting} />
                </MDBContainer>
            ) : (
                <div className="register">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                    />
                    <button type="button" onClick={registerUser}>
                        connect
                    </button>
                    
                </div>
            )}

        </div>
    );
};

export default Room;
