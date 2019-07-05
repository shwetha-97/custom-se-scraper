const se_scraper = require('./../src/node_scraper.js');

(async () => {
    let browser_config = {
        headless: true,
        debug_level: 1,
        output_file: 'examples/results/dillards.json',
        dillards_settings: {
            dillards_domain: 'dillards.com',
        }
    };

    let scrape_job = {
        search_engine: 'dillards',
        keywords: ['shirt', 'dress'],
        num_pages: 1,
    };

    var scraper = new se_scraper.ScrapeManager(browser_config);
    await scraper.start();

    var results = await scraper.scrape(scrape_job);
    console.dir(results, {depth: null, colors: true});
    await scraper.quit();
})();
