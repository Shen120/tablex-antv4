import React from "react";

import {Checkbox, Menu} from "../widgets";


const MenuIcon = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"></path>
    </svg>
  );
};

export const ColumnDropMenuButton = props => {
  return (
    <span {...props} className="tablex__head__cell__title__dropdown">
      <MenuIcon />
    </span>
  );
};

class HeadDropMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: []
    };
    this.stateRef = React.createRef(null);
    this.stateRef.current = {
      isOnClick: false
    };
  }

  onChange = (columnKey, config) => {
    if (typeof this.props.onChange === "function") {
      this.props.onChange(columnKey, config);
    }
  };

  onFilterColumnChange = (checked, key) => {
    this.onChange(key, {
      hidden: !checked
    });
  };

  columnsFilter = () => {
    let { columns: arr, columnsConfig } = this.props;

    let columns = arr; //.filter(d => !!d.title)

    const columnsOptions = [];
    const defaultChecked = [];

    columns.forEach((c, i) => {
      let columnKey = c.key || c.dataIndex;

      let isHide = false;

      let config = (columnsConfig || {})[columnKey] || {};

      isHide = !!config.hidden;

      if ("hidden" in config) {
        isHide = !!config.hidden;
      } else {
        isHide = !!c.hidden;
      }

      if (isHide === false) {
        defaultChecked.push(columnKey);
      }

      let TitleComponent = c.title;
      let titleElement = null;

      if (typeof TitleComponent === "function") {
        titleElement = <TitleComponent column={c} />;
      } else {
        titleElement = c.title;
      }

      columnsOptions.push(
        <div key={i} style={{ display: "block" }}>
          <Checkbox
            checked={!isHide}
            value={columnKey}
            onChange={e => {
              this.onFilterColumnChange(e.target.checked, columnKey);
            }}
          >
            {titleElement}
          </Checkbox>
        </div>
      );
    });

    return (
        <div style={{marginLeft: 10}}>{columnsOptions}</div>
    );
  };

  handleClick = ({ item, key, keyPath, domEvent }) => {
    let { columnKey } = this.props;

    let config = {
      1: {
        fixed: "left"
      },
      2: {
        fixed: "right"
      },
      3: {
        fixed: false
      },
      6: {
        grouped: true
      },
      7: {
        grouped: false
      },
      8: {
        grouped: "none"
      }
    }[key];

    config && this.onChange(columnKey, config);

    domEvent.stopPropagation();
  };

  onTitleClick({ key, domEvent }) {
    domEvent.stopPropagation();
  }

  onItemClick = () => {
    this.stateRef.current.isOnClick = true;
  };

  render() {
    let styles = { height: "auto", lineHeight: "normal", padding: "0px 10px" };

    let { fixable, filterable, groupable } = this.props.options;

    return (
      <div className="tablex__column__dropMenu">
        <Menu
          forceSubMenuRender={false}
          onClick={this.handleClick}
          selectable={false}
          style={{ width: 160 }}
          mode="vertical"
          openKeys={this.state.openKeys}
          onOpenChange={keys => {
            if (this.stateRef.current.isOnClick === true && keys.length === 0) {
              this.stateRef.current.isOnClick = false;
              return;
            }
            this.stateRef.current.isOnClick = false;
            this.setState({ openKeys: keys });
          }}
          items={[
            fixable && {
              key: "sub1",
              label: this.props.intl["columnMenuFixed"],
              onTitleClick: this.onTitleClick,
              children: [
                {key: "1", label: this.props.intl["columnMenuFixedLeft"], style: styles},
                {key: "2", label: this.props.intl["columnMenuFixedRight"], style: styles},
                {key: "3", label: this.props.intl["columnMenuFixedReset"], style: styles},
              ]
            },
            filterable && {
              key: "sub2",
              label: this.props.intl["columnMenuVisible"],
              onTitleClick: this.onTitleClick,
              children: [
                {key: "4", label: this.columnsFilter(), style: styles, onClick: this.onItemClick},
              ]
            },
            groupable && {
              key: "sub3",
              label: this.props.intl["columnMenuGroup"],
              onTitleClick: this.onTitleClick,
              children: [
                {key: "6", label: this.props.intl["columnMenuGroupAdd"], style: styles},
                {key: "7", label: this.props.intl["columnMenuGroupRemove"], style: styles},
                {key: "8", label: this.props.intl["columnMenuGroupReset"], style: styles},
              ]
            }
          ].filter(Boolean)}
        />
      </div>
    );
  }
}

HeadDropMenu.defaultProps = {
  intl: {
    settingTitle: "表格配置",
    settingReset: "重置",
    settingOk: "确定",
    settingWidth: "宽度：",
    settingFixed: "冻结：",
    settingFixedLeft: "左",
    settingFixedRight: "右",
    settingVisible: "显示",
    settingHidden: "隐藏",
    settingFixedNone: "表格配置"
  }
};

export default HeadDropMenu;
