//The amount of quote entered during purchase corresponds to how many current coins can be purchased
//inputValue is the number of coins entered in the input
export function calQuoteBase(
    bonding_curve_token_amount,
    bonding_curve_quote_amount,
    inputValue,
    fee_rate,
    quote_token_decimal,
    virtual_quote_reserves,
    init_token_amount,
    base_token_decimal
) {
    let current_base_supply = bonding_curve_token_amount;
    let current_quote_balance = bonding_curve_quote_amount;
    let buy_quote_amount = numToString(
        new BigNumber(inputValue * (1 - fee_rate / 10000)).times(`1e${quote_token_decimal}`).dp(0, BigNumber.ROUND_DOWN)
    );
    let m = Number(virtual_quote_reserves) - Number(current_quote_balance);
    let p = Number(current_quote_balance) + Number(buy_quote_amount);
    let n = init_token_amount;
    let np = n * p;
    let m_plus_p = Number(m) + Number(p);
    let tokens_bought = numToString(
        new BigNumber(Number(np / m_plus_p) - Number(current_base_supply)).div(`1e${base_token_decimal}`)
    );
    return tokens_bought;
}

//The current amount of coins entered when selling corresponds to how many quote can be sold
//inputValue is the number of coins entered in the input
export function calBaseQuote(
    bonding_curve_token_amount,
    bonding_curve_quote_amount,
    inputValue,
    base_token_decimal,
    virtual_quote_reserves,
    init_token_amount,
    quote_token_decimal,
    fee_rate
) {
    let current_base_supply = bonding_curve_token_amount;
    let current_quote_balance = bonding_curve_quote_amount;
    let sell_quote_amount = numToString(new BigNumber(inputValue).times(`1e${base_token_decimal}`).dp(0, BigNumber.ROUND_DOWN));
    let k = Number(current_base_supply) - Number(sell_quote_amount);
    let m = Number(virtual_quote_reserves) - Number(current_quote_balance);
    let n = init_token_amount;
    let km = k * m;
    let n_minus_k = Number(n) - Number(k);
    let lamports_received = numToString(
        new BigNumber(Number(current_quote_balance) - Number(km / n_minus_k)).div(`1e${quote_token_decimal}`)
    );
    return lamports_received * (1 - fee_rate / 10000);
}

export const numToString = (num) => {
    let m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
};
