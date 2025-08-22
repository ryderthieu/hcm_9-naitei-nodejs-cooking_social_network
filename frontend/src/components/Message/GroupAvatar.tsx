import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { useAuth } from "../../contexts/AuthContext";
import type { Member } from "../../types/conversation.type";

interface GroupAvatarProps {
  members: Member[];
  maxCount?: number;
  size?: "small" | "default" | "large" | number;
}

export const GroupAvatar = ({
  members,
  maxCount = 3,
  size = "default",
}: GroupAvatarProps) => {
  const { user } = useAuth();
  const otherMembers = members.filter((member) => member.id !== user?.id);
  const getSize = () => {
    if (typeof size === "number") return size;
    switch (size) {
      case "small":
        return 32;
      case "large":
        return 64;
      default:
        return 40;
    }
  };

  const avatarSize = getSize();
  const containerSize = avatarSize;

  if (otherMembers.length === 0) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
        style={{ width: containerSize, height: containerSize }}
      >
        <img
          src={DEFAULT_AVATAR_URL}
          alt="Default"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (otherMembers.length === 1) {
    return (
      <div
        className="rounded-full overflow-hidden"
        style={{ width: containerSize, height: containerSize }}
      >
        <img
          src={otherMembers[0].avatar || DEFAULT_AVATAR_URL}
          alt={`${otherMembers[0].firstName} ${otherMembers[0].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const remainingCount = otherMembers.length - maxCount;

  if (otherMembers.length === 2) {
    const smallSize = avatarSize * 0.7;

    return (
      <div
        className="relative"
        style={{ width: containerSize, height: containerSize }}
      >
        <div
          className="absolute top-0 left-0 rounded-full overflow-hidden border-2 border-white"
          style={{
            width: smallSize,
            height: smallSize,
            zIndex: 1,
          }}
        >
          <img
            src={otherMembers[0].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[0].firstName} ${otherMembers[0].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute bottom-0 right-0 rounded-full overflow-hidden border-2 border-white"
          style={{
            width: smallSize,
            height: smallSize,
            zIndex: 2,
          }}
        >
          <img
            src={otherMembers[1].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[1].firstName} ${otherMembers[1].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (otherMembers.length === 3) {
    const smallSize = avatarSize * 0.6;

    return (
      <div
        className="relative"
        style={{ width: containerSize, height: containerSize }}
      >
        <div
          className="absolute top-0 left-0 rounded-full overflow-hidden border-2 border-white"
          style={{
            width: smallSize,
            height: smallSize,
            zIndex: 3,
          }}
        >
          <img
            src={otherMembers[0].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[0].firstName} ${otherMembers[0].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute top-0 right-0 rounded-full overflow-hidden border-2 border-white"
          style={{
            width: smallSize,
            height: smallSize,
            zIndex: 2,
          }}
        >
          <img
            src={otherMembers[1].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[1].firstName} ${otherMembers[1].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full overflow-hidden border-2 border-white"
          style={{
            width: smallSize,
            height: smallSize,
            zIndex: 1,
          }}
        >
          <img
            src={otherMembers[2].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[2].firstName} ${otherMembers[2].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  const smallSize = avatarSize * 0.5;

  return (
    <div
      className="relative grid grid-cols-2 gap-0.5"
      style={{ width: containerSize, height: containerSize }}
    >
      <div
        className="rounded-full overflow-hidden border border-white"
        style={{ width: smallSize, height: smallSize }}
      >
        <img
          src={otherMembers[0].avatar || DEFAULT_AVATAR_URL}
          alt={`${otherMembers[0].firstName} ${otherMembers[0].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white"
        style={{ width: smallSize, height: smallSize }}
      >
        <img
          src={otherMembers[1].avatar || DEFAULT_AVATAR_URL}
          alt={`${otherMembers[1].firstName} ${otherMembers[1].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white"
        style={{ width: smallSize, height: smallSize }}
      >
        <img
          src={otherMembers[2].avatar || DEFAULT_AVATAR_URL}
          alt={`${otherMembers[2].firstName} ${otherMembers[2].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white flex items-center justify-center"
        style={{ width: smallSize, height: smallSize }}
      >
        {otherMembers.length > maxCount ? (
          <div className="bg-gray-500 text-white text-xs font-semibold w-full h-full flex items-center justify-center">
            +{remainingCount}
          </div>
        ) : otherMembers[3] ? (
          <img
            src={otherMembers[3].avatar || DEFAULT_AVATAR_URL}
            alt={`${otherMembers[3].firstName} ${otherMembers[3].lastName}`}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
};
