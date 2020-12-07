'use strict';

//todo implement letters to numbers
function get_ss_int(num) {
    return parseInt(num);
}

//add numbers from 0 to num - 1
//should probably have a better name than total
function total(num) {
    let total = 0;
    for(let i = 0; i < num; i++) {
        total = total + i;
    }
    return total;
}

//returns boolean of input being a valid siteswap
//maps each number to itself plus its position mod period
//this gives the landing spot of the throw
//siteswap is valid if each landing spot is different
function valid_ss (siteswap_str) {
    const ss = siteswap_str.split("");
    const period = ss.length;
    const check = ss.map(function(num,i) {
                            return (get_ss_int(num) + i) % period;
                         });

    //true if check array has numbers 0 to period - 1, false otherwise
    //totals numbers in check and ensures no duplicates                     
    if (check.reduce((a,b) => a + b, 0) === total(period) && period === new Set(check).size) {
        //console.log('true');
        return true;
    }
    
    //console.log('false');
    return false;
}

module.exports = { is_siteswap: valid_ss }
