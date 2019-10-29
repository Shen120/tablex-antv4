import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import Table from "./Table";
import "./styles.css";
import {
  formatColumns,
  addClass,
  removeClass,
  delegate,
  isNumber
} from "./utils";
import ReactResizeDetector from "react-resize-detector";

const HEADER_HEIGHT = 40;

class BaseDataGrid extends React.Component {
  headRef = React.createRef();
  leftRef = React.createRef();
  rightRef = React.createRef();
  middleRef = React.createRef();
  containerRef = React.createRef();
  rightWrapperRef = React.createRef();
  headInstance = null;
  mainScrollerIns = null;

  constructor(props) {
    super(props);
    this.state = {
      prevProps: null,
      data: [],
      formattedColumns: {},
      rowKey: "",
      hoverable: true,
      scrollbarX: 0,
      scrollbarY: 0,
      needResetScrollbar: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevProps !== nextProps) {
      let { data, columns, prependColumns, rowKey, hoverable } = nextProps;

      let formattedColumns = formatColumns(columns, prependColumns);

      let nextState = {
        rowKey,
        data,
        formattedColumns,
        hoverable,
        prevProps: nextProps,
        tableHeight: nextProps.height
      };

      if (
        prevState.tableHeight !== nextProps.height ||
        data.length !== prevState.data.length
      ) {
        nextState.needResetScrollbar = true;
      }

      return nextState;
    }
    return null;
  }

  onLeftScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
    }
  };

  onRightScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested === false) {
      this.middleRef.current && this.middleRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  onMiddleScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    //true: api called  false: user interaction
    if (scrollUpdateWasRequested === false) {
      this.rightRef.current && this.rightRef.current.scrollTo(scrollOffset);
      this.leftRef.current && this.leftRef.current.scrollTo(scrollOffset);
    }
  };

  setFrozenStyle = () => {
    let headEl = this.headRef.current;

    if (!headEl) {
      return;
    }

    let scrollLeft = headEl.scrollLeft;

    let headScrollWidth = headEl.scrollWidth;
    let headOffsetWidth = headEl.offsetWidth;

    let containerEl = this.containerRef.current;

    if (containerEl) {
      let cls = "tablex-forzen-scrolled";
      let leftEl = containerEl.getElementsByClassName("tablex-forzen-left")[0];
      let rightEl = containerEl.getElementsByClassName(
        "tablex-forzen-right"
      )[0];
      if (leftEl) {
        if (scrollLeft > 0) {
          leftEl.classList.add(cls);
        } else {
          leftEl.classList.remove(cls);
        }
      }

      if (rightEl) {
        if (scrollLeft + headOffsetWidth + 1 < headScrollWidth) {
          rightEl.classList.add(cls);
        } else {
          rightEl.classList.remove(cls);
        }
      }
    }
  };

  onDataListScroll = e => {
    let headEl = this.headRef.current;

    if (!headEl) {
      return;
    }
    let scrollLeft = e.target.scrollLeft;
    this.headRef.current.scrollLeft = scrollLeft;

    this.middleRef.current && this.middleRef.current.extraScrollTo(scrollLeft);

    this.setFrozenStyle();
  };

  resetScrollbarSize = () => {
    let ms = this.mainScrollerIns;

    if (ms) {
      let { scrollbarX, scrollbarY } = this.state;

      let X =
        (ms.offsetHeight - ms.clientHeight) * (window.devicePixelRatio || 1);
      let Y =
        (ms.offsetWidth - ms.clientWidth) * (window.devicePixelRatio || 1);

      if (scrollbarX !== X || scrollbarY !== Y) {
        this.setState({
          scrollbarX: X,
          scrollbarY: Y,
          needResetScrollbar: false
        });
      }
    }
  };

  outterInit = ins => {
    this.mainScrollerIns = ins;
    this.resetScrollbarSize();
    if (this.headInstance === null) {
      this.headInstance = ins;
      if (this.props.showHeader !== false) {
        ins.addEventListener("scroll", this.onDataListScroll);
      }
    }

    if (typeof this.props.scrollRef === "function") {
      this.props.scrollRef(ins);
    }
  };

  changeRowHoverClass = (e, target) => {
    let hoverCls = "tablex-table-row--hovered";

    let containerEl = this.containerRef.current;

    let rowIndex = -1;

    if (target) {
      rowIndex = target.dataset.rowindex;
    }

    let rows = [];

    rows = containerEl.getElementsByClassName("tablex-table-row-" + rowIndex);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (e.type === "mouseout") {
        removeClass(r, hoverCls);
      } else if (e.type === "mouseover") {
        addClass(r, hoverCls);
      }
    }
  };

  bindHoverClass = () => {
    let containerEl = this.containerRef.current;

    if (containerEl) {
      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseenter",
        this.changeRowHoverClass
      );

      delegate(
        containerEl,
        ".tablex-table-row",
        "mouseleave",
        this.changeRowHoverClass
      );
    }
  };

  componentDidMount() {
    if (typeof this.props.innerRef === "function") {
      this.props.innerRef(this);
    }
    if (this.state.hoverable) {
      this.bindHoverClass();
    }
    this.setFrozenStyle();
  }

  componentDidUpdate() {
    if (this.state.needResetScrollbar === true) {
      this.resetScrollbarSize();
    }
  }

  resetAfterIndex(index, shouldForceUpdate) {
    this.middleRef.current &&
      this.middleRef.current.resetAfterIndex(index, shouldForceUpdate);
    this.leftRef.current &&
      this.leftRef.current.resetAfterIndex(index, shouldForceUpdate);
    this.rightRef.current &&
      this.rightRef.current.resetAfterIndex(index, shouldForceUpdate);
  }

  scrollToItem(index, align) {
    this.leftRef.current && this.leftRef.current.scrollToItem(index, align);
    this.middleRef.current && this.middleRef.current.scrollToItem(index, align);
    this.rightRef.current && this.rightRef.current.scrollToItem(index, align);
  }

  scrollToRow(key, align) {
    this.leftRef.current && this.leftRef.current.scrollToRow(key, align);
    this.middleRef.current && this.middleRef.current.scrollToRow(key, align);
    this.rightRef.current && this.rightRef.current.scrollToRow(key, align);
  }

  rowRender = params => {
    let fn = this.props.rowRender;

    if (typeof fn === "function") {
      return fn(params);
    }
  };

  getTableHeight = () => {
    let {
      height,
      rowHeight,
      autoHeight,
      maxHeight,
      minHeight,
      showHeader,
      headerRowHeight
    } = this.props;

    let { data, formattedColumns, scrollbarX } = this.state;
    let maxDepth = formattedColumns.maxDepth;

    //表头高度
    let headerHeight = 0;
    let headerHeights = [];

    if (showHeader === true) {
      for (let i = 0; i < maxDepth + 1; i++) {
        let h = headerRowHeight[i];
        if (!isNumber(h)) {
          h = HEADER_HEIGHT;
        }
        headerHeights.push(h);
        headerHeight = headerHeight + h;
      }
    }

    let tableHeight = height;

    if (autoHeight === true || !tableHeight) {
      let rh = 40;
      if (typeof rowHeight === "number") {
        rh = rowHeight;
      }
      let totalRowsHeight = data.length * rh;
      tableHeight = totalRowsHeight + headerHeight + scrollbarX + 2;
    }

    if (tableHeight < minHeight) {
      tableHeight = minHeight;
    }

    if (tableHeight > maxHeight) {
      tableHeight = maxHeight;
    }

    return { tableHeight, headerHeights, headerHeight };
  };

  render() {
    let { width, className, overlayRenderer, bordered } = this.props;

    let props = this.props;

    let { data, rowKey, scrollbarX, scrollbarY, formattedColumns } = this.state;

    let {
      middle,
      left,
      leftWidth,
      right,
      rightWidth,
      maxDepth
    } = formattedColumns;

    let hasLeft = left.length > 0;
    let hasRight = right.length > 0;

    let { tableHeight, headerHeight, headerHeights } = this.getTableHeight();

    let headStyle = {};

    headStyle.marginRight = scrollbarY;

    let rightStyles = {
      width: rightWidth,
      overflow: "hidden"
    };

    if (scrollbarY >= 0) {
      rightStyles.marginLeft = -scrollbarY - 1;
    }

    let frozens = {};
    if (hasLeft) {
      frozens.left = leftWidth;
    }
    if (hasRight) {
      frozens.right = rightWidth;
    }

    let attrs = {
      ...props,
      data,
      rowKey,
      scrollbarX,
      scrollbarY,
      columnsDepth: maxDepth,
      headerHeight,
      headerRowHeight: headerHeights
    };

    let overlay = null;
    if (typeof overlayRenderer === "function") {
      overlay = overlayRenderer({ headerHeight });
    }

    let cls = ["tablex-container"];
    if (className) {
      cls.push(className);
    }

    if (bordered === true) {
      cls.push("tablex-bordered");
    }

    cls = cls.join(" ");

    return (
      <div
        className={cls}
        style={{ width, height: tableHeight }}
        ref={this.containerRef}
      >
        {overlay}
        {hasLeft ? (
          <div
            className="tablex-forzen-left"
            style={{
              width: leftWidth,
              overflow: "hidden"
            }}
          >
            <div
              className="tablex-forzen-left-scroll"
              style={{
                width: leftWidth + scrollbarY + 1,
                height: "100%"
              }}
            >
              <Table
                {...attrs}
                headStyle={{ width: leftWidth }}
                containerHeight={tableHeight - scrollbarX}
                columns={left}
                style={{ overflowX: "hidden" }}
                innerStyle={{ width: leftWidth }}
                ref={this.leftRef}
                onScroll={this.onLeftScroll}
                rowRender={params =>
                  this.rowRender({
                    ...params,
                    frozen: "left",
                    frozens: frozens
                  })
                }
              />
            </div>
          </div>
        ) : null}
        <div className="tablex-main" style={{ overflow: "hidden" }}>
          <Table
            {...attrs}
            containerHeight={tableHeight}
            columns={middle}
            ref={this.middleRef}
            onScroll={this.onMiddleScroll}
            outerRef={this.outterInit}
            headRef={this.headRef}
            headStyle={headStyle}
            rowRender={params =>
              this.rowRender({
                ...params,
                frozen: "none",
                frozens: frozens
              })
            }
          />
        </div>

        {hasRight ? (
          <div
            className="tablex-forzen-right"
            ref={this.rightWrapperRef}
            style={rightStyles}
          >
            <Table
              {...attrs}
              containerHeight={tableHeight - scrollbarX}
              headStyle={{ width: rightWidth }}
              columns={right}
              style={{ overflowX: "hidden" }}
              onScroll={this.onRightScroll}
              ref={this.rightRef}
              rowRender={params =>
                this.rowRender({
                  ...params,
                  frozen: "right",
                  frozens: frozens
                })
              }
            />
          </div>
        ) : null}
      </div>
    );
  }
}

const AutoSizerTable = forwardRef((props, ref) => {
  return (
    <ReactResizeDetector handleWidth handleHeight>
      {({ width, height }) => {
        return (
          <BaseDataGrid {...props} height={height} width={width} ref={ref} />
        );
      }}
    </ReactResizeDetector>
  );
});

BaseDataGrid.defaultProps = {
  columns: [],
  prependColumns: [],
  data: [],
  frozenRender: {
    rowHeight: 40,
    rowKey: "",
    top: [],
    bottom: []
  },
  rowHeight: 40,
  headerRowHeight: [],
  rowKey: "key",
  showHeader: true,
  hoverable: true,
  bordered: true,
  virtual: true,
  autoHeight: false
};

BaseDataGrid.propTypes = {
  /** 是否自动高度，为true时表格的高度将会随行数而变化 */
  autoHeight: PropTypes.bool,

  /** 表格区域最小高度 */
  minHeight: PropTypes.number,

  /** 表格区域最大高度 */
  maxHeight: PropTypes.number,

  /** 是否显示表头 */
  showHeader: PropTypes.bool,

  /** 是否显示边框 */
  bordered: PropTypes.bool,

  /** 鼠标hover样式 */
  hoverable: PropTypes.bool,

  /** 是否启用虚拟加载 */
  virtual: PropTypes.bool,

  /** 行高 */
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

  /** 表头行高 */
  headerRowHeight: PropTypes.arrayOf(PropTypes.number),

  /** 自定义行样式 */
  rowClassName: PropTypes.func,

  /**
   * 表格列
   *
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
        PropTypes.element
      ]),
      width: PropTypes.number,
      key: PropTypes.string.isRequired,
      dataIndex: PropTypes.string,
      align: PropTypes.oneOf(["left", "right", "center"]),
      halign: PropTypes.oneOf(["left", "right", "center"]),
      minWidth: PropTypes.number,
      fixed: PropTypes.oneOf([false, "left", "right"]),
      resizable: PropTypes.bool,
      render: PropTypes.func,
      validator: PropTypes.func,
      editor: PropTypes.func
    })
  ),

  /** 额外前置添加的列 */
  prependColumns: PropTypes.array,

  /**
   * 表格数据
   */
  data: PropTypes.array.isRequired,

  /** 固定行数据渲染 */
  frozenRender: PropTypes.shape({
    rowHeight: PropTypes.number,
    rowKey: PropTypes.string.isRequired,
    top: PropTypes.array,
    bottom: PropTypes.array,
    rowRender: PropTypes.func,
    cellRender: PropTypes.func,
    onRow: PropTypes.func,
    onCell: PropTypes.func
  }),

  /** 数据行主键字段
   */
  rowKey: PropTypes.string.isRequired,

  /**
   * 覆盖table元素，如：components:{row:func}
   */
  components: PropTypes.object,

  /** 获取数据滚动区域ref */
  scrollRef: PropTypes.func,

  /** 自定义行内渲染 */
  rowRender: PropTypes.func,

  /** 自定义行属性，可处理行事件 */
  onRow: PropTypes.func,

  /** 自定义行组件属性 */
  onRowComponent: PropTypes.func,

  /** 自定义列属性，可处理列事件 */
  onCell: PropTypes.func,

  /** 列宽拖动完成事件，(width, columnKey) */
  onColumnResizeStop: PropTypes.func,

  /** 获取table ref */
  innerRef: PropTypes.func,

  /** 获取 list ref */
  listRef: PropTypes.func
};

export default AutoSizerTable;
