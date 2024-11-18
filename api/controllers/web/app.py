import json
import logging
import os
from urllib.parse import urljoin

import requests
from flask_restful import marshal_with
from flask import request

from controllers.common import fields
from controllers.common import helpers as controller_helpers
from controllers.web import api
from controllers.web.error import AppUnavailableError
from controllers.web.wraps import WebApiResource
from models.model import App, AppMode
from services.app_service import AppService

logger = logging.getLogger(__name__)
gunicorn_error_logger = logging.getLogger('gunicorn.error')
logger.handlers.extend(gunicorn_error_logger.handlers)
logger.setLevel(logging.DEBUG)
logger.debug('this will show in the log')


class AppParameterApi(WebApiResource):
    """Resource for app variables."""

    @marshal_with(fields.parameters_fields)
    def get(self, app_model: App, end_user):
        """Retrieve app parameters."""
        if app_model.mode in {AppMode.ADVANCED_CHAT.value, AppMode.WORKFLOW.value}:
            workflow = app_model.workflow
            if workflow is None:
                raise AppUnavailableError()

            features_dict = workflow.features_dict
            user_input_form = workflow.user_input_form(to_old_structure=True)
        else:
            app_model_config = app_model.app_model_config
            if app_model_config is None:
                raise AppUnavailableError()

            features_dict = app_model_config.to_dict()

            user_input_form = features_dict.get("user_input_form", [])

        parameters = controller_helpers.get_parameters_from_feature_dict(
            features_dict=features_dict, user_input_form=user_input_form
        )
        logger.error(f'Request args: {request.args}')
        if url := request.args.get("url"):
            parameters["suggested_questions"] = self.fetch_opening_questions(url)

        return parameters

    def fetch_opening_questions(self, url: str) -> list[str]:
        base_url = os.environ.get("OPENING_QUESTIONS_BASE_URL", "http://localhost:5001/v1")
        endpoint_api_key = os.environ.get("OPENING_QUESTIONS_API_KEY")
        if not base_url or not endpoint_api_key:
            return []
        headers = {
            "Authorization": f"Bearer {endpoint_api_key}",
            "Content-Type": "application/json",
        }
        content = {
            "inputs": {
                "context": json.dumps(request.args)
            },
            "response_mode": "blocking",
            "user": "internal",
        }
        endpoint_url = urljoin(base_url, "workflows/run")
        response = requests.post(
            endpoint_url,
            headers=headers,
            json=content
        )
        logger.error(
            f'Fetching opening questions for url: {url}, status_code: {response.status_code}, response: {response.content.decode()}'
        )
        try:
            return response.json().get("data", {}).get("outputs", {}).get("questions", [])
        except Exception as ex:
            logger.error(f"Failed to get questions: {ex}")
            return []


class AppMeta(WebApiResource):
    def get(self, app_model: App, end_user):
        """Get app meta"""
        return AppService().get_app_meta(app_model)


api.add_resource(AppParameterApi, "/parameters")
api.add_resource(AppMeta, "/meta")
