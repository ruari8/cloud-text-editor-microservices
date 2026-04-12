use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use average_word_length::analysis;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting word length analyzer service at http://0.0.0.0:80");

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(web::resource("/health").route(web::get().to(analysis::health_check)))
            .service(web::resource("/analyze").route(web::post().to(analysis::analyze_text)))
    })
    .bind(("0.0.0.0", 80))?
    .run()
    .await
}
