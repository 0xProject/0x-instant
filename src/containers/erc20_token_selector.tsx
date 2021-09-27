import * as _ from "lodash";
import * as React from "react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SearchInput } from "../components/search_input";
import { TokenRowFilter } from "../components/token_row_filter";
import { Container } from "../components/ui/container";
import { Text } from "../components/ui/text";
import { updateTokenSelect } from "../redux/actions";
import { getAvailableTokens } from "../redux/selectors";
import { ColorOption } from "../style/theme";
import { TokenInfo } from "../types";
import { analytics } from "../util/analytics";

export interface ERC20TokenSelectorProps {
  isIn: boolean;
  onTokenSelect: () => void;
}

export const ERC20TokenSelectorContainer = (props: ERC20TokenSelectorProps) => {
  const tokens = useSelector(getAvailableTokens);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, _setPage] = React.useState(0);
  const [perPage, _setPerPage] = React.useState(10);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
    analytics.trackTokenSelectorSearched(searchQuery);
  };

  const handleTokenClick = (token: TokenInfo) => {
    // do on token Select here
    dispatch(updateTokenSelect(token, props.isIn));
    props.onTokenSelect();
  };
  const filteredTokens = useMemo(() => {
    return tokens
      .filter(
        (t) =>
          t.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
          t.symbol.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      )
      .slice(0, perPage * (page + 1));
  }, [tokens, searchQuery, page, perPage]);

  return (
    <Container height="100%">
      <Container marginBottom="10px">
        <Text
          fontColor={ColorOption.darkGrey}
          fontSize="18px"
          fontWeight="600"
          lineHeight="22px"
        >
          Select Token
        </Text>
      </Container>
      <SearchInput
        placeholder="Search tokens..."
        width="100%"
        value={searchQuery}
        onChange={handleSearchInputChange}
        tabIndex={-1}
      />
      <Container overflow="scroll" height="calc(100% - 90px)" marginTop="10px">
        <TokenRowFilter
          tokens={filteredTokens}
          onClick={handleTokenClick}
          searchQuery={searchQuery}
        />
      </Container>
    </Container>
  );
};
