import { Button, message, Popover } from 'antd';
import moment from 'moment';
import React from 'react';

import { chat } from '@/module/chat/orgchat';

import content from './groupContent.module.less';

const GroupContent = () => {
  const isShowTime = (index: number) => {
    if (index == 0) return true;
    return (
      moment(chat.curMsgs.value[index].createTime).diff(
        chat.curMsgs.value[index - 1].createTime,
        'minute',
      ) > 3
    );
  };

  // 显示聊天间隔时间
  const showChatTime = (chatDate: moment.MomentInput) => {
    const cdate = moment(chatDate);
    const days = moment().diff(cdate, 'day');
    switch (days) {
      case 0:
        return cdate.format('H:mm');
      case 1:
        return '昨天 ' + cdate.format('H:mm');
      case 2:
        return '前天 ' + cdate.format('H:mm');
    }
    const year = moment().diff(cdate, 'year');
    if (year == 0) {
      return cdate.format('M月D日 H:mm');
    }
    return cdate.format('yy年 M月D日 H:mm');
  };

  // 重新编辑功能
  const handleReWrite = (txt: string) => {
    // info.value = txt;
    // emit('handleReWrite', txt);
  };
  const deleteMsg = (item: any) => {
    item.edit = false;
    chat.deleteMsg(item);
  };
  const canDelete = (item: any) => {
    if (item.chatId) {
      return true;
    }
    return item.spaceId === chat.userId.value;
  };
  const recallMsg = (item: any) => {
    item.edit = false;
    if (item.chatId) {
      item.id = item.chatId;
      delete item.chatId;
      delete item.sessionId;
    }
    chat.recallMsg(item).then((res: ResultType) => {
      if (res.data != 1) {
        message.warning('只能撤回2分钟内发送的消息');
      }
    });
  };

  return (
    <div className={content.group_content_wrap}>
      {chat.curMsgs.map((item, index) => {
        return (
          <React.Fragment key={item.fromId}>
            {/* 聊天间隔时间3分钟则 显示时间 */}
            {isShowTime(index) ? (
              <div className={content.chats_space_Time}>
                <span>{showChatTime(item.createTime)}</span>
              </div>
            ) : (
              ''
            )}
            {/* 重新编辑 */}
            {item.msgType === 'recall' ? (
              <div
                className={`${content.group_content_left} ${content.con} ${content.recall}`}>
                {item.showTxt}
                {item.allowEdit ? (
                  <span
                    className={content.reWrite}
                    onClick={() => {
                      handleReWrite(item.msgBody);
                    }}>
                    重新编辑
                  </span>
                ) : (
                  ''
                )}
              </div>
            ) : (
              ''
            )}
            {/* 左侧聊天内容显示 */}
            {item.fromId !== chat.userId.value ? (
              <div className={`${content.group_content_left} ${content.con}`}>
                <Popover
                  content={
                    canDelete(item) ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          deleteMsg(item);
                        }}>
                        删除
                      </Button>
                    ) : (
                      ''
                    )
                  }
                  title="Title"
                  trigger="click">
                  <div className={content.con_content}>
                    {chat.curChat.value.typeName !== '人员' ? (
                      <span className="con-content-name">
                        {chat.getName(item.fromId)}
                      </span>
                    ) : (
                      ''
                    )}
                    <span></span>
                  </div>
                </Popover>
              </div>
            ) : (
              <>
                {/* 右侧聊天内容显示 */}
                <div className={`${content.group_content_right} ${content.con}`}>
                  <Popover
                    content={
                      canDelete(item) ? (
                        <>
                          <Button
                            type="primary"
                            onClick={() => {
                              recallMsg(item);
                            }}>
                            撤回
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => {
                              deleteMsg(item);
                            }}>
                            删除
                          </Button>
                        </>
                      ) : (
                        ''
                      )
                    }
                    title="Title"
                    trigger="click">
                    <div className={content.con_content}>
                      {chat.curChat.value.typeName !== '人员' ? (
                        <span className="con-content-name">
                          {chat.getName(item.fromId)}
                        </span>
                      ) : (
                        ''
                      )}
                      <span></span>
                    </div>
                  </Popover>
                </div>
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default GroupContent;
