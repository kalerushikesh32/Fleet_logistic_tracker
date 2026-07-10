"""
Domain exception hierarchy.

Services raise these; a single set of FastAPI exception handlers (registered in
main.py) maps them to HTTP responses. This keeps route handlers free of
repetitive try/except blocks and guarantees one consistent error shape.
"""


class DomainError(Exception):
    """Base for all business-rule errors. Maps to an HTTP response by subclass."""

    status_code = 400
    code = "DOMAIN_ERROR"

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(DomainError):
    status_code = 404
    code = "NOT_FOUND"


class ConflictError(DomainError):
    """Duplicate resource or a request that violates a uniqueness constraint."""

    status_code = 409
    code = "CONFLICT"


class InvalidStateError(DomainError):
    """A request that is invalid for the resource's current state."""

    status_code = 409
    code = "INVALID_STATE"
