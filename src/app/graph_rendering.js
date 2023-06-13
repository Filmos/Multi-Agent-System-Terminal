let globalData = {};

function throttle(callback, delay = 1000) {
    let shouldWait = false;
    let isWaiting = false;

    return () => {
        if (shouldWait) { isWaiting = true; return; }

        callback();
        shouldWait = true;
        setTimeout(() => {
            shouldWait = false;
            if (isWaiting) {
                isWaiting = false;
                callback();
            }
        }, delay);
    };
}

function makeGraphElements() {
    return {
        nodes: Object.keys(globalData.nodes).map((key) => ({
            data: {
                id: key,
                label: globalData.nodes[key]
            }
        })),
        edges: globalData.edges.map((edge, i) => ({
            data: {
                id: `e${i}`,
                source: edge.from,
                target: edge.to,
                label: edge.label
            }
        }))
    }
}

const renderGraphInner = throttle(function () {
    document.getElementById('panel-graph-container').innerHTML = '<div class="panel panel-vertical" id="panel-graph"></div>'
    setTimeout(() => {
        var graph = cytoscape({
            layout: {
                name: 'cose',
                idealEdgeLength: 100,
                nodeOverlap: 20,
                refresh: 20,
                fit: true,
                padding: 30,
                randomize: false,
                componentSpacing: 500,
                nodeRepulsion: 400000,
                edgeElasticity: 200,
                nestingFactor: 5,
                gravity: 80,
                numIter: 10000,
                initialTemp: 300,
                coolingFactor: 0.95,
                minTemp: 1.0
            },
            container: document.getElementById('panel-graph'),
            elements: makeGraphElements(),
            maxZoom: 4,
            minZoom: 0.25,
            style: [
                {
                    "selector": "node[label]",
                    "style": {
                        "label": "data(label)",
                        "text-wrap": "wrap",
                        "text-max-width": 140,
                        "color": "#e3e6f9",
                        "background-color": "#e3e6f9"
                    }
                },
                {
                    "selector": "edge[label]",
                    "style": {
                        "label": "data(label)",
                        "curve-style": "bezier",
                        "control-point-step-size": 120,
                        "width": 3,
                        "color": "#282a36",
                        "text-outline-color": "#c3c9e4",
                        "text-outline-width": 2,
                        "line-color": "#c3c9e4",
                        "line-opacity": 0.35,
                        "text-wrap": "wrap",
                        "text-max-width": 250,
                        "target-arrow-color": "#c3c9e4",
                        "target-arrow-shape": "triangle",
                        "arrow-scale": 1.6
                    }
                }
            ]
        });
    }, 10)
})

window.addEventListener("resize", () => document.querySelector("#graph-tab.active") && renderGraphInner());

function renderGraph(data) {
    globalData = data;
    renderGraphInner();
}

module.exports = { renderGraph }