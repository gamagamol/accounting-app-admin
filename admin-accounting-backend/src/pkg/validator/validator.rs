use std::collections::BTreeMap;

use validator::{Validate, ValidationErrors};

/// Converts validator errors into field-keyed messages for the API envelope.
pub fn validate<T: Validate>(payload: &T) -> Result<(), BTreeMap<String, String>> {
    payload.validate().map_err(format_errors)
}

fn format_errors(errors: ValidationErrors) -> BTreeMap<String, String> {
    let mut messages = BTreeMap::new();

    for (field, field_errors) in errors.field_errors() {
        let message = field_errors
            .iter()
            .filter_map(|error| error.message.as_ref())
            .map(|message| message.to_string())
            .collect::<Vec<_>>()
            .join(", ");

        messages.insert(
            field.to_string(),
            if message.is_empty() {
                "is invalid".to_string()
            } else {
                message
            },
        );
    }

    messages
}
