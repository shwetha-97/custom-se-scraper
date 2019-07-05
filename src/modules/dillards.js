const cheerio = require('cheerio');
const Scraper = require('./se_scraper');

class DillardsScraper extends Scraper {

    constructor(...args) {
        super(...args);
    }

    parse(html) {
        // load the page source into cheerio
        const $ = cheerio.load(html);

        // perform queries
        const results = [];
        $('#search .col-xs-4 result-tile').each((i, product) => {
            //TODO: this is absolute horrible, but so is parsing html

            let resobj = {};
            try {
                resobj.image = $(product).find('[result-tile-above] a').attr('href');
            } catch (err) {
            }



            try {
                resobj.link = $(product).find('[ShopNewArrivals]a').attr('href');
            } catch (err) {
            }

            try {
                resobj.title = $(product).find('.productName').text();
            } catch (err) {
            }

            try {
                resobj.stars = $(product).find('.sr-only').text();
            } catch (err) {
            }

            

            try {
                resobj.price = $(product).find('.price-wrapper .price').text();
            } catch (err) {
            }

            
            results.push(resobj);
        });

        let no_results = this.no_results(
            ['Keine Ergebnisse', 'No results for '],
            $('#search').text()
        );

        

        const cleaned = [];
        for (var res of results) {
            if (res.link && res.link.trim() && res.title && res.title.trim() && res.price && res.price.trim() && res.stars.trim()) {
                res.rank = this.result_rank++;
                cleaned.push(res);
            }
        }

        return {
            time: (new Date()).toUTCString(),
            num_results: $('.pagination-wrapper .itemCount').text(),
            no_results: no_results,
            
            results: cleaned
        }
    }

    async load_start_page() {
        let startUrl = 'https://www.dillards.com/';

        if (this.config.dillards_settings) {
            startUrl = `https://www.${this.config.dillards_settings.dillards_domain}`;
            if (this.config.dillards_settings.dillards_domain) {
                startUrl = `https://www.${this.config.dillards_settings.dillards_domain}`;
            } else {
                startUrl = 'https://www.dillards.com/'; 
            }

            for (var key in this.config.amazon_settings) {
                if (key !== 'dillards_domain') {
                    startUrl += `${key}=${this.config.dillards_settings[key]}&`
                }
            }
        }

        if (this.config.verbose) {
            console.log('Using startUrl: ' + startUrl);
        }

        this.last_response = await this.page.goto(startUrl);

        try {
            await this.page.waitForSelector('input[id="headerSiteSearch"]', { timeout: this.STANDARD_TIMEOUT });
        } catch (e) {
            return false;
        }

        return true;
    }

    async search_keyword(keyword) {
        const input = await this.page.$('input[id="headerSiteSearch"]');
        await this.set_input_value(`input[id="headerSiteSearch"]`, keyword);
        await this.sleep(50);
        await input.focus();
        await this.page.keyboard.press("Enter");
    }

    async next_page() {
        let next_page_link = await this.page.$('.pagination-wrapper span span span span span span span', {timeout: 1000});
        if (!next_page_link) {
            return false;
        }
        await next_page_link.click();

        return true;
    }

    async wait_for_results() {
        await this.page.waitForSelector('.col-xs-10 results-column', { timeout: this.STANDARD_TIMEOUT });
    }

    async detected() {
        const title = await this.page.title();
        let html = await this.page.content();
        return html.indexOf('detected unusual traffic') !== -1 || title.indexOf('/sorry/') !== -1;
    }
}


module.exports = {
    DillardsScraper: DillardsScraper,
};
