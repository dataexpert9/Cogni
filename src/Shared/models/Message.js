import { MessageSendingType } from "../../helpers/constents";

export class IMessageViewModel {
    id;
    message;
    date;
    senderUserName;
    senderUserId;
    senderUserImage;
    isMedia;
    mediaURL;
    channel;
    messageType;
    messageDeliveryStatus;
    messageStatusType;
    index;
    token;
    receiverUserId;
  }