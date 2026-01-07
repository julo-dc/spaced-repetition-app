class Topic {
  final String id;
  final String name;
  final String? parentId;
  final String slug;

  Topic({
    required this.id,
    required this.name,
    this.parentId,
    required this.slug,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] as String,
      name: json['name'] as String,
      parentId: json['parent_id'] as String?,
      slug: json['slug'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'parent_id': parentId,
      'slug': slug,
    };
  }

  Topic copyWith({
    String? id,
    String? name,
    String? parentId,
    String? slug,
  }) {
    return Topic(
      id: id ?? this.id,
      name: name ?? this.name,
      parentId: parentId ?? this.parentId,
      slug: slug ?? this.slug,
    );
  }
}
