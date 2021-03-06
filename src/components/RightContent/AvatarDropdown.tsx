import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, message, Dropdown } from 'antd';
import { history, useModel } from 'umi';
import { layoutActionRef } from '@/app';
import { createService, isSuccess } from '@/utils/requestUtils';
import { storageClear } from '@/utils/tokenUtils';
import { nickNameAndAvatar } from '@/utils/constant';
import styles from './index.less';

const logout = createService('/account/logout', 'post');
const AvatarDropdown = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  async function handleLogout() {
    const res = await logout();
    if (isSuccess(res)) {
      setInitialState((s: any) => ({
        ...s,
        userInfo: {},
        permissions: [],
        menuData: [],
      })).then(() => {
        history.push('/user/login');
        // 退出登录，刷新菜单
        layoutActionRef?.current?.reload?.();
        storageClear();
      });
    } else {
      message.info(res?.statusMessage);
    }
  }

  const onMenuClick = async ({ key }: any) => {
    switch (key) {
      case 'center': {
        message.info('敬请期待！');
        //history.push('/user/center');
        break;
      }
      case 'settings': {
        message.info('敬请期待！');
        //history.push('/user/setting');
        break;
      }
      case 'logout': {
        handleLogout();
        break;
      }
      default:
        break;
    }
  };

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
  if (!initialState?.userInfo?.accountSid) {
    return loading;
  }
  const menuHeaderDropdown = (
    <Menu className={styles.menu} onClick={(e) => onMenuClick(e)}>
      <Menu.Item key="center">
        <UserOutlined />
        个人中心
      </Menu.Item>
      <Menu.Item key="settings">
        <SettingOutlined />
        个人设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menuHeaderDropdown} placement="bottomLeft">
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar
          size="small"
          className={styles.avatar}
          src={initialState?.userInfo?.userAvatar || nickNameAndAvatar[1]}
          alt="avatar"
        />
        <span>{initialState?.userInfo?.userName || nickNameAndAvatar[0]}</span>
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
