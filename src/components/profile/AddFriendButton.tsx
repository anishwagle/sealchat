
'use client';
import { useState } from 'react';
import { Profile } from '@/types/profile';
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth';
import { IoPersonAddSharp } from 'react-icons/io5';


type FriendshipStatus = Profile['friendshipStatus'];

type AddFriendButtonProps = {
    profile: Profile;
    onUpdate: (newStatus: FriendshipStatus) => void;
    size?: 'large' | 'medium' | 'small';
}

export default function AddFriendButton({ profile, onUpdate, size = 'large' }: AddFriendButtonProps) {
    const [loadingActionType, setLoadingActionType] = useState<null | "accept" | "decline" | "send" | "cancel" | "unfriend">(null);

    const handleFriendAction = async (endpoint: string, action: "accept" | "decline" | "send" | "cancel" | "unfriend", newStatus: FriendshipStatus) => {
        setLoadingActionType(action);
        try {
            await fetchWithAuth(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId2: profile.userId }),
            });
            onUpdate(newStatus);
        } finally {
            setLoadingActionType(null);
        }
    };

    const buttonContent = {
        large: {
            none: "Add Friend",
            sent: "Cancel Request",
            accepted: "Unfriend",
            receivedAccept: "Accept Friend",
            receivedDecline: "Decline Request"
        },
        medium: {
            none: "Add",
            sent: "Cancel",
            accepted: "Unfriend",
            receivedAccept: "Accept",
            receivedDecline: "Decline"
        },
        small: {
            none: <IoPersonAddSharp />,
            sent: <IoPersonAddSharp color='red' />,
            accepted: <IoPersonAddSharp color='red' />,
            receivedAccept: <IoPersonAddSharp color='green' />,
            receivedDecline: <IoPersonAddSharp color='red' />
        }
    };

    const currentContent = buttonContent[size];

    if (profile.friendshipStatus === "none") {
        return (
            <button
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${size === 'small' ? 'bg-transparent' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                onClick={() => handleFriendAction("/api/protected/friend/sendRequest", "send", "sent")}
                disabled={loadingActionType !== null}
            >
                {loadingActionType === "send" ? "Loading..." : currentContent.none}
            </button>
        );
    }

    if (profile.friendshipStatus === "sent") {
        return (
            <button
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${size === 'small' ? 'bg-transparent' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                onClick={() => handleFriendAction("/api/protected/friend/cancelRequest", "cancel", "none")}
                disabled={loadingActionType !== null}
            >
                {loadingActionType === "cancel" ? "Loading..." : currentContent.sent}
            </button>
        );
    }

    if (profile.friendshipStatus === "received") {
        return (
            <>
                <button
                    className={`px-6 py-2 font-medium rounded-lg transition-colors ${size === 'small' ? 'bg-transparent' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    onClick={() => handleFriendAction("/api/protected/friend/acceptRequest", "accept", "accepted")}
                    disabled={loadingActionType === "decline" || loadingActionType === "accept"}
                >
                    {loadingActionType === "accept" ? "Loading..." : currentContent.receivedAccept}
                </button>
                <button
                    className={`px-6 py-2 font-medium rounded-lg transition-colors ${size === 'small' ? 'bg-transparent' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    onClick={() => handleFriendAction("/api/protected/friend/cancelRequest", "decline", "none")}
                    disabled={loadingActionType === "accept" || loadingActionType === "decline"}
                >
                    {loadingActionType === "decline" ? "Loading..." : currentContent.receivedDecline}
                </button>
            </>
        );
    }

    if (profile.friendshipStatus === "accepted") {
        return (
            <button
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${size === 'small' ? 'bg-transparent' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={() => handleFriendAction("/api/protected/friend/unfriend", "unfriend", "none")}
                disabled={loadingActionType !== null}
            >
                {loadingActionType === "unfriend" ? "Loading..." : currentContent.accepted}
            </button>
        );
    }

    return null;
}
