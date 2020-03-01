import React, { useEffect, useState } from 'react';
import { Button, Paper } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import * as chromeAsync from 'chrome-extension-async';

const SCRAPE_INTERVAL = 2000;

function getFnBody(fn) {
  const fnStr = fn.toString();
  return fnStr.substring(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'));
}

async function clearLinks({ key = 'default' } = {}) {
  // eslint-disable-next-line
  await chrome.storage.local.set({ [key]: {} });
}

async function getLinks({ key = 'default' } = {}) {
  // eslint-disable-next-line
  return (await chrome.storage.local.get([key]))[key];
}

async function appendLinks({ key = 'default', links } = {}) {
  // eslint-disable-next-line
  const data = await chrome.storage.local.get([key]);
  const allLinks = data[key] || {};

  links.map((l) => {
    const date = allLinks[l];
    if (!date) {
      allLinks[l] = Date.now();
    }
  });
  // eslint-disable-next-line
  await chrome.storage.local.set({ [key]: allLinks });
}

async function scrapePage() {
  // eslint-disable-next-line
  const tabs = await chrome.tabs.query({
    url: '*://*.linkedin.com/search/results/people/*',
  });
  const activeTab = tabs[0];

  // eslint-disable-next-line
  await chrome.tabs.executeScript(activeTab.id, {
    code: `(${scrollToBottom})()`,
  });

  await new Promise((resolve) => {
    setTimeout(resolve, SCRAPE_INTERVAL);
  });

  // eslint-disable-next-line
  const results = await chrome.tabs.executeScript(activeTab.id, {
    code: `(${getLinkedInHrefs})()`,
  });

  const hrefs = results[0];
  await appendLinks({ links: hrefs });

  // eslint-disable-next-line
  await chrome.tabs.executeScript(activeTab.id, {
    code: `(${clickNext})()`,
  });
}

// Chrome Injected Code
function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function getLinkedInHrefs() {
  const hrefList = [];
  const list = document.querySelectorAll(
    '.search-result__info a.search-result__result-link',
  );
  list.forEach((node) => {
    hrefList.push(node.href);
  });
  return hrefList;
}

function clickNext() {
  document.querySelector('.artdeco-pagination__button--next').click();
}

function Home() {
  const [state, setState] = useState({ linkCount: 0 });
  const [scrapeRunning, setScrapeRunning] = useState(false);
  const [scrapeJobId, setScrapeJobId] = useState(null)

  async function toggleScrapePage() {
    if (!scrapeRunning) {
      setScrapeJobId(setInterval(scrapePage, SCRAPE_INTERVAL));
    } else {
      clearInterval(scrapeJobId)
    }

    setScrapeRunning(!scrapeRunning);
  }

  useEffect(() => {
    async function init() {
      const links = await getLinks();
      const linkCount = Object.keys(links).length;
      setState({ ...state, linkCount });
    }
    init();
  }, [state, scrapeRunning, scrapeJobId]);

  return (
    <div>
      <Paper>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={toggleScrapePage}
          >
            {scrapeRunning ? 'Stop Scraping' : 'Start Scraping'}
          </Button>
        </div>
        <div>
          <Button variant="contained" color="secondary" onClick={clearLinks}>
            Clear
          </Button>
        </div>
      </Paper>
      <Paper>
        <div>Link Count: {state.linkCount}</div>
        <div>Running: {String(scrapeRunning)}</div>
      </Paper>
    </div>
  );
}

export default Home;
