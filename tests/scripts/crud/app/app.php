<?php
/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * The code in this file is terrible and only used for testing purposes
 */

use Klein\Klein;
use Medoo\Medoo;

ini_set('html_errors', false);

require_once __DIR__ . '/../vendor/autoload.php';

$klein = new Klein();

$klein->respond(function ($request, $response, $service, $app) use ($klein) {
  $app->db = new Medoo([
    'database_type' => 'sqlite',
    'database_file' => __DIR__ . '/../database.sqlite',
  ]);
});

$klein->with('/v1/[:resource]', function () use ($klein) {
  // Listing
  $klein->respond('GET', '/?', function ($request, $response, $_, $app) {
    $data = $app->db->select($request->resource, [
      'id', 'name', 'description', 'created_at', 'updated_at',
    ]);

    if ($data === false) {
      $data = [];
    }

    $data = [
      'success' => true,
      'data' => $data,
    ];

    $response->json($data);
  });

  // Create
  $klein->respond('POST', '/?', function ($request, $response, $_, $app) {
    $data = json_decode($request->body(), true);

    $keys = array_keys($data);
    array_multisort($keys);

    if ($keys !== ['description', 'name']) {
      $data = [
        'success' => false,
        'error' => [
          'type' => 'invalid_data',
          'message' => json_encode($keys) . " !== ['name', 'description']",
        ]
      ];

      $response->code(422);
    } else {
      $data['created_at'] = date("c"); // ISO8601
      $data['updated_at'] = null;

      $table = $request->resource;

      $app->db->query("
        CREATE TABLE IF NOT EXISTS $table (
          id integer primary key,
          name text,
          description text,
          image_data blob,
          image_mime text,
        
          created_at text,
          updated_at text
        );");

      $app->db->insert($table, $data);

      $data['id'] = +$app->db->id();

      $data = [
        'success' => true,
        'data' => $data,
      ];
    }

    $response->json($data);
  });

  $klein->with('/[i:id]', function () use ($klein) {
    // Get by id
    $klein->respond('GET', '/?', function ($request, $response, $_, $app) {
      $data = $app->db->get($request->resource, [
        'id', 'name', 'description', 'created_at', 'updated_at',
      ], ['id' => $request->id]);

      if (!!$data) {
        $data = [
          'success' => true,
          'data' => $data,
        ];
      } else {
        $data = [
          'success' => false,
          'error' => [
            'type' => 'not_found',
            'message' => "'$request->resource' with id '$request->id' does not exist"
          ]
        ];

        $response->code(404);
      }

      $response->json($data);
    });

    // Update
    $klein->respond('PATCH', '/?', function ($request, $response, $_, $app) {
      // Update regardless
      $data = json_decode($request->body(), true);
      $data_new = [];

      if (isset($data['name'])) {
        $data_new['name'] = $data['name'];
      } elseif (isset($data['description'])) {
        $data_new['description'] = $data['description'];
      }

      $rowCount = 0;
      if (count(array_keys($data_new)) > 0) {
        $dbResponse = $app->db->update($request->resource, $data_new, ['id' => $request->id]);
        $rowCount = $dbResponse->rowCount();
      }

      if ($rowCount === 0) {
        $data = [
          'success' => false,
          'error' => "'$request->resource' with id '$request->id' does not exist"
        ];

        $response->code(404);
        $response->json($data);
      } else {
        $data = [
          'success' => true,
          'data' => [],
        ];

        $response->code(200);
        $response->json($data);
      }
    });

    $klein->with('/image', function () use ($klein) {
      $klein->respond('GET', '/?', function ($request, $response, $_, $app) {
        $image = $app->db->get($request->resource, ['image_data', 'image_mime'], ['id' => $request->id]);

        if (!!$image) {
          $response->header('Content-Type', $image['image_mime']);
          $response->body($image['image_data']);
        } else {
          $data = [
            'success' => false,
            'error' => [
              'type' => 'image_not_found',
              'message' => "Image for '$request->resource' with id '$request->id' does not exist"
            ]
          ];

          $response->code(404);
          $response->json($data);
        }
      });

      $klein->respond('POST', '/?', function ($request, $response, $_, $app) {
        $image = $request->files()['image'];

        if (is_null($image)) {
          $data = [
            'success' => false,
            'error' => [
              'type' => 'no_data',
              'message' => 'Expected field "image" to be a file'
            ],
          ];

          $response->json($data);
        } else {
          $imageData = @file_get_contents($image['tmp_name']);

          $dbResponse = $app->db->update($request->resource, ['image_data' => $imageData, 'image_mime' => $image['type'],], ['id' => $request->id]);
          $rowCount = $dbResponse->rowCount();

          if ($rowCount === 0) {
            $data = [
              'success' => false,
              'error' => [
                'type' => 'not_found',
                'message' => "'$request->resource' with id '$request->id' does not exist"
              ]
            ];

            $response->code(404);
            $response->json($data);
          } else {
            $data = [
              'success' => true,
              'data' => [],
            ];

            $response->json($data);
          }
        }
      });

      $klein->respond('DELETE', '/?', function ($request, $response, $_, $app) {
        $table = $request->resource;
        $id = +$request->id;
        $app->db->query("UPDATE OR INGORE $table SET image_data = NULL AND image_mime = NULL WHERE id = $id;");

        $data = [
          'success' => true,
          'data' => [],
        ];

        $response->json($data);
      });
    });
  });
});

$klein->dispatch();