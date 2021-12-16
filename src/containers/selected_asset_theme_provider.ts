import * as _ from 'lodash';
import { connect } from 'react-redux';

import { State } from '../redux/reducer';
import { Theme, theme as defaultTheme, ThemeProvider } from '../style/theme';

export interface SelectedAssetThemeProviderProps {}

interface ConnectedState {
    theme: Theme;
}

const getTheme = (): Theme => {

    return defaultTheme;
};

const mapStateToProps = (state: State, _ownProps: SelectedAssetThemeProviderProps): ConnectedState => {
    const theme = getTheme();
    return { theme };
};

export const SelectedAssetThemeProvider = connect(
    mapStateToProps,
)(ThemeProvider);
