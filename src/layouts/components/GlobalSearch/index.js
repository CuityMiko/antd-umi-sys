import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { HeaderSearch } from '@components';
import memoizeOne from 'memoize-one';
import Context from '@context';
import { searchEqual } from './_';
import styles from './index.less';

class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            initStatus: 0,
            searchData: [],
        };
        this.handleSearch = memoizeOne(this.handleSearch);
        this.handleSelect = memoizeOne(this.handleSelect);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { flattenMenuData } = nextProps;
        const { initStatus } = prevState;
        if (Array.isArray(flattenMenuData) && flattenMenuData.length > 0 && initStatus === 0) {
            return {
                searchData: flattenMenuData,
                initStatus: 1
            };
        }
        return prevState;
    }
    handleSearch(value) {
        const { flattenMenuData } = this.props;
        const dataSource = flattenMenuData.filter(item => item.title.indexOf(value) > -1);
        this.setState({
            searchData: dataSource,
        });
    }
    handleSelect(value) {
        const { dispatch } = this.props;
        const { searchData } = this.state;
        const res = searchEqual(value, searchData);
        const { link, key, query, ...rest } = res;
        if (link) {
            dispatch(routerRedux.push({
                pathname: link,
                query: { ...query, key: link.indexOf("frame") > -1 ? key : undefined },
                state: {
                    key,
                    ...rest,
                },
            }));
        }
    }
    render() {
        const { searchData, } = this.state;
        return (
            <Context.Consumer>
                {({ theme }) => (
                    <HeaderSearch
                        className={`${styles.action} ${styles.search}`}
                        placeholder="站内搜索"
                        dataSource={searchData}
                        onSearch={value => {
                            this.handleSearch(value);
                        }}
                        onPressEnter={value => {
                            console.log('enter', value); // eslint-disable-line
                        }}
                        onSelect={value => {
                            this.handleSelect(value);
                        }}
                        theme={theme}
                    />
                )}
            </Context.Consumer>

        );
    }
}
function mapStateToProps({ menu: { flattenMenuData } }) {
    return {
        flattenMenuData
    };
}
export default connect(mapStateToProps)(Search);