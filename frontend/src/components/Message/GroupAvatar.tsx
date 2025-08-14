import { DEFAULT_AVATAR_URL } from "../../constants/constants";
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

  if (members.length === 0) {
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

  if (members.length === 1) {
    return (
      <div
        className="rounded-full overflow-hidden"
        style={{ width: containerSize, height: containerSize }}
      >
        <img
          src={members[0].avatar || DEFAULT_AVATAR_URL}
          alt={`${members[0].firstName} ${members[0].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const displayMembers = members.slice(0, maxCount);
  const remainingCount = members.length - maxCount;

  if (members.length === 2) {
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
            src={members[0].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[0].firstName} ${members[0].lastName}`}
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
            src={members[1].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[1].firstName} ${members[1].lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (members.length === 3) {
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
            src={members[0].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[0].firstName} ${members[0].lastName}`}
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
            src={members[1].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[1].firstName} ${members[1].lastName}`}
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
            src={members[2].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[2].firstName} ${members[2].lastName}`}
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
          src={members[0].avatar || DEFAULT_AVATAR_URL}
          alt={`${members[0].firstName} ${members[0].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white"
        style={{ width: smallSize, height: smallSize }}
      >
        <img
          src={members[1].avatar || DEFAULT_AVATAR_URL}
          alt={`${members[1].firstName} ${members[1].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white"
        style={{ width: smallSize, height: smallSize }}
      >
        <img
          src={members[2].avatar || DEFAULT_AVATAR_URL}
          alt={`${members[2].firstName} ${members[2].lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="rounded-full overflow-hidden border border-white flex items-center justify-center"
        style={{ width: smallSize, height: smallSize }}
      >
        {members.length > maxCount ? (
          <div className="bg-gray-500 text-white text-xs font-semibold w-full h-full flex items-center justify-center">
            +{remainingCount}
          </div>
        ) : members[3] ? (
          <img
            src={members[3].avatar || DEFAULT_AVATAR_URL}
            alt={`${members[3].firstName} ${members[3].lastName}`}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
};
