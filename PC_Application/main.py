# app.py
import dash
import dash_bootstrap_components as dbc
from dash import html, dcc, Output, Input, State
import plotly.graph_objs as go
import random
import datetime

# 1. App setup with Bootstrap theme
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.LITERA])
server = app.server

# 2. Sidebar: channel list + add/remove
sidebar = dbc.Card(
    [
        html.H5("Channels", className="card-title"),
        html.Div(id="channel-list", children=[
            dbc.ListGroupItem([
                dbc.Badge(color="danger", className="me-2"),
                "Channel 0",
                dbc.Badge("18.3 °C", color="secondary", className="ms-auto"),
                dbc.Button("⚙️", color="link", size="sm", className="ms-2")
            ], className="d-flex align-items-center")
        ]),
        dbc.Button("+ Add Channel", color="primary", className="mt-2"),
        dbc.Button("Remove", color="danger", className="mt-2"),
    ],
    body=True,
    className="h-100"
)

# 3. Top card: current value
current_card = dbc.Card(
    dbc.CardBody(
        [
            html.Span("●", style={"color": "red"}),
            html.H4(id="current-value", className="d-inline ms-2"),
            html.Div("+0.1% from yesterday", className="text-success small"),
            html.Div("Avg: 19.8 °C", className="text-muted small"),
        ]
    ),
    className="mb-4"
)

# 4. Graph area
graph = dcc.Graph(id="timeseries", config={"displayModeBar": False})

# 5. Main layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(sidebar, width=3),
        dbc.Col([
            dbc.Row(dbc.Col(current_card)),
            dbc.Row(dbc.Col(html.H4("Time Series Analysis"))),
            dbc.Row(dbc.Col(html.Small("Trend analysis for selected metrics over the last 30 days"), className="mb-2")),
            dbc.Row(dbc.Col(graph)),
        ], width=9),
    ], className="gy-4")
], fluid=True)


# 6. Callbacks to generate dummy data
@app.callback(
    Output("current-value", "children"),
    Output("timeseries", "figure"),
    Input("timeseries", "id")
)
def update_data(_):
    # generate dummy current value
    now = datetime.datetime.now()
    temp = round(18 + random.random(), 2)
    # generate 30 days of data
    dates = [now - datetime.timedelta(days=i) for i in reversed(range(30))]
    temps = [18 + random.uniform(-0.5, 0.5) for _ in dates]
    fig = go.Figure(
        go.Scatter(x=dates, y=temps, mode="lines", line=dict(color="red"))
    )
    fig.update_layout(
        margin=dict(l=20, r=20, t=10, b=20),
        xaxis=dict(showgrid=False),
        yaxis=dict(title="°C")
    )
    return f"{temp} °C", fig


if __name__ == "__main__":
    app.run(debug=True)
