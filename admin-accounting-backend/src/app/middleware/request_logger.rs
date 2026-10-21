use tower_http::trace::{
    DefaultMakeSpan, DefaultOnBodyChunk, DefaultOnEos, DefaultOnFailure, DefaultOnRequest,
    DefaultOnResponse, HttpMakeClassifier, TraceLayer,
};
use tracing::Level;

/// Tower HTTP trace layer used as the request logger.
pub fn request_logger() -> TraceLayer<
    HttpMakeClassifier,
    DefaultMakeSpan,
    DefaultOnRequest,
    DefaultOnResponse,
    DefaultOnBodyChunk,
    DefaultOnEos,
    DefaultOnFailure,
> {
    TraceLayer::new_for_http()
        .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
        .on_response(DefaultOnResponse::new().level(Level::INFO))
}
